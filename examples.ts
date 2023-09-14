// npm install uuid
// import { v4 as uuidv4 } from "./uuid";

// uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

const pop = (coll: string[], ...keys: string[]): string[] => {
  let newColl = coll.slice();
  const has_key = (item: string) => keys.includes(item);
  if (keys.length < 0) return coll;
  return newColl.filter(
    (item) => !has_key(item) && !has_key(item.split("/")[1])
  );
};

type Query = string | { [keyof: string]: any } | Query[];

const jsToClj = (data: Query) => {
  const join = (s: any[]): string => s.join(" ");

  const parse = (value: any) => {
    const vType = Array.isArray(value) ? "array" : typeof value;

    switch (vType) {
      case "object":
        const pairs = Object.entries(data).map(
          ([k, v]) => `${parse(k)} ${parse(v)}`
        );
        return join(["{", join(pairs), "}"]);

      case "array":
        return join(["[", value.map(jsToClj), "]"]);

      case "string":
        return value.startsWith(":") ? value : `"${value}"`;

      default:
        return value;
    }
  };

  return parse(data);
};

const buildContext = (data: Query, resolveTo: Query) => {
  const [x, ...xs] = Object.entries(data).sort(([k1, _v1], [k2, _v2]) =>
    k1 > k2 ? 1 : -1
  );
  const cursor = jsToClj(x);
  const context = jsToClj(Object.fromEntries(xs));
  const query = jsToClj(resolveTo);

  return `{(${cursor} :pathom/context ${context}) ${query}}`;
};

const farmerBase = [
  ":farmer/id",
  ":farmer/name",
  ":farmer/nickname",
  ":farmer/mobile",
  ":farmer/lang",
  ":farmer/farms",
  ":farmer/state",
  ":farmer/district",
  ":farmer/sub-districts",
  ":farmer/taluka",
  ":farmer/village",
  ":farmer/favourite-crops",
] as const;

const farmers = ":farmers";

const farmersByData = (data: string[] = farmerBase.slice()) =>
  `"{[:farmers {:farmer/id [${data}]}]}"`;

const farmerById = (fid: string) => `"{[:farmer/id ${fid}] [${farmerBase}]}"`;

const pushFarmer = (data: { [K in (typeof farmerBase)[number]]: any }) =>
  `(farmer/push ${jsToClj(data)})`;

const searcTalukas = (data: { ":state": string; ":district": string }) => {
  return buildContext(data, [":talukas"]);
};

const selected = pop(farmerBase.slice(), ":farmer/farms", ":farmer/mobile");

const kmReq = async (token: string, ...query: Query[]) => {
  const resp = await fetch(`${process.env("KM_URI")}/pathom-json`, {
    method: "POST",
    headers: {
      Authourization: `Bearer ${token}`,
      "Content-Type": "application/edn",
    },
    body: JSON.stringify({ query: [...query] }),
  });
  return await resp.json();
};

console.log(kmReq("", farmers));
